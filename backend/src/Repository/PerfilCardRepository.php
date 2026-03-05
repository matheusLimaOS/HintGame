<?php

namespace App\Repository;

use App\Entity\Category;
use App\Entity\PerfilCard;
use App\Entity\TipsRevealed;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

class PerfilCardRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PerfilCard::class);
    }

    public function findRandomByCategory(Category $category, User $user): ?array
    {
        $result = $this->createQueryBuilder('pc')
        ->select('pc.id AS id')
        ->leftJoin(
            TipsRevealed::class,
            'tr',
            'WITH',
            'tr.card = pc AND tr.user = :user'
        )
        ->where('pc.category = :category')
        ->andWhere('tr.id IS NULL')
        ->setParameter('user', $user)
        ->setParameter('category', $category)
        ->setMaxResults(1)
        ->getQuery()
        ->getArrayResult();

        shuffle($result);

        return $result[0] ?? null;
    }

    public function findAllByCategory(Category $category): ?array
    {
        $result = $this->createQueryBuilder('pc')
        ->select('pc.answer AS answer, pc.id AS id')
        ->where('pc.category = :category')
        ->setParameter('category', $category)
        ->getQuery()
        ->getArrayResult();

        return $result;
    }

    public function findAllByCategoryAndUser(Category $category, User $user): ?array
    {
        $result = $this->createQueryBuilder('pc');

        $subQb = $this->getEntityManager()->createQueryBuilder()
                ->select('1')
                ->from(TipsRevealed::class, 'tr')
                ->where('tr.card = pc')
                ->andWhere('tr.user = :user')
                ->andWhere('tr.guessRight = true');

        $result
        ->where('pc.category = :category')
        ->andWhere(
            $result->expr()->not(
                $result->expr()->exists($subQb->getDQL())
            )
        )
        ->setParameter('category', $category)
        ->setParameter('user', $user)
        ;

        return $result->getQuery()->getArrayResult();
    }

    //    /**
    //     * @return PerfilCard[] Returns an array of PerfilCard objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('p.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?PerfilCard
    //    {
    //        return $this->createQueryBuilder('p')
    //            ->andWhere('p.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
