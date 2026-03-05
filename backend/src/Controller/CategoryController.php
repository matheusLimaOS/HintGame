<?php

namespace App\Controller;

use App\Entity\Category;
use App\Repository\CategoryRepository;
use App\Repository\PerfilCardRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class CategoryController extends AbstractController
{
    #[Route('/api/category', methods: ['GET'])]
    public function categories(
        CategoryRepository $categoryRepository,
        PerfilCardRepository $perfilCardRepository,
    ): JsonResponse {
        $user = $this->getUser();
        $categories = $categoryRepository->findAll();

        $data = array_map(fn ($category) => [
            'id' => $category->getId(),
            'name' => $category->getName(),
            'cards' => array_map(fn ($card) => [
                'id' => $card['id'],
            ], $perfilCardRepository->findAllByCategoryAndUser($category, $user)),
        ], $categories);

        return $this->json($data);
    }

    #[Route('/api/category', methods: ['POST'])]
    public function createCategory(
        Request $request,
        EntityManagerInterface $em,
        CategoryRepository $categoryRepository,
    ): JsonResponse {
        $data = $request->toArray();
        $category = $categoryRepository->findOneBy(['name' => $data['name']]);
        if (!$category) {
            $category = new Category();
            $category->setName($data['name']);
            $em->persist($category);
            $em->flush();
        }

        return $this->json([
            'id' => $category->getId(),
            'name' => $category->getName(),
        ]);
    }
}
