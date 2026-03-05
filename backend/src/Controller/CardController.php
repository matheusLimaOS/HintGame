<?php

namespace App\Controller;

use App\Entity\PerfilCard;
use App\Entity\PerfilTip;
use App\Repository\CategoryRepository;
use App\Repository\PerfilCardRepository;
use App\Repository\PerfilTipRepository;
use App\Repository\TipsRevealedRepository;
use App\Service\GeminiService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class CardController extends AbstractController
{
    #[Route('/api/card', methods: ['POST'])]
    public function card(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepository,
    ): JsonResponse {
        $data = $request->toArray();
        $category = $categoryRepository->find($data['category']);
        if (!$category) {
            return $this->json(['error' => 'Categoria não encontrada'], 404);
        }
        $card = new PerfilCard();
        $card->setAnswer($data['answer']);
        $card->setCategory($category);
        $nextOrder = 1;

        foreach ($data['tips'] as $tipData) {
            $cardTip = new PerfilTip();
            $cardTip->setTip($tipData);
            $cardTip->setTipOrder($nextOrder);
            $card->addTip($cardTip);
            ++$nextOrder;
        }

        $em->persist($card);
        $em->flush();

        return $this->json([
            'id' => $card->getId(),
            'category' => $card->getCategory()->getName(),
            'answer' => $card->getAnswer(),
        ]);
    }

    #[Route('/api/card/random', name: 'play_card_random', methods: ['GET'])]
    public function getRandomCard(
        Request $request,
        PerfilCardRepository $cardRepository,
        CategoryRepository $categoryRepository,
    ): JsonResponse {
        $category = $request->query->get('category');
        $user = $this->getUser();

        $categoryFind = $categoryRepository->find($category);

        if (!$category || !$categoryFind) {
            return $this->json(['error' => 'Category required'], 400);
        }

        $card = $cardRepository->findRandomByCategory($categoryFind, $user);

        if (!$card) {
            return $this->json(['error' => 'No cards found'], 404);
        }

        return $this->json([
            'cardId' => $card['id'],
        ]);
    }

    #[Route('/api/card/{id}', methods: ['GET'])]
    public function getCardById(
        PerfilCard $card,
        TipsRevealedRepository $revealedTipRepository,
        PerfilTipRepository $tipRepository,
    ): JsonResponse {
        $user = $this->getUser();
        $alreadyGuessedRight = $revealedTipRepository->hasAlreadyGuessedRightUserAndCard($user, $card);
        if ($alreadyGuessedRight) {
            $revealedTipIds = $tipRepository->findTips($card);
        } else {
            $revealedTipIds = $revealedTipRepository->findRevealedTipIdsForUserAndCard($user, $card);
        }
        $guessRemaining = $revealedTipRepository->countUnguessedTipsForUserAndCard($user, $card);

        $tips = array_map(
            function ($tip) use ($revealedTipIds) {
                $isRevealed = in_array($tip->getId(), $revealedTipIds, true);

                return [
                    'tipOrder' => $tip->getTipOrder(),
                    'revealed' => $isRevealed,
                    'size' => strlen($tip->getTip()),
                    'tip' => $isRevealed ? $tip->getTip() : null,
                ];
            },
            $card->getTips()->toArray()
        );

        return $this->json([
            'id' => $card->getId(),
            'category' => $card->getCategory()->getName(),
            'guessRemaining' => $guessRemaining > 0 ? true : false,
            'alreadyGuessRight' => $alreadyGuessedRight,
            'answer' => $alreadyGuessedRight ? $card->getAnswer() : null,
            'tips' => $tips,
        ]);
    }

    #[Route('/admin/cartas/gerar', methods: ['POST'])]
    public function gerarCarta(
        Request $request,
        CategoryRepository $categoryRepository,
        PerfilCardRepository $cardRepository,
        EntityManagerInterface $em,
        GeminiService $gemini,
    ): JsonResponse {
        $data = $request->toArray();
        $categoryFind = $categoryRepository->find($data['categoryId']);
        if (!$categoryFind) {
            return $this->json(['error' => 'Categoria não encontrada'], 404);
        }
        $cardsInCategory = $cardRepository->findAllByCategory($categoryFind);
        $cards = implode(', ', array_map(fn ($card) => $card['answer'], $cardsInCategory));

        $resultado = $gemini->generateCardTips(
            $categoryFind->getName(),
            $cards
        );

        $card = new PerfilCard();
        $card->setAnswer($resultado['resposta']);
        $card->setCategory($categoryFind);
        $nextOrder = 1;

        foreach ($resultado['dicas'] as $tipData) {
            $cardTip = new PerfilTip();
            $cardTip->setTip($tipData);
            $cardTip->setTipOrder($nextOrder);
            $card->addTip($cardTip);
            ++$nextOrder;
        }

        $em->persist($card);
        $em->flush();

        return $this->json($card->getId());
    }
}
