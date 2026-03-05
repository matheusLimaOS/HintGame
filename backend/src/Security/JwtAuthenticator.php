<?php

namespace App\Security;

use App\Repository\UserRepository;
use App\Service\JwtService;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class JwtAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private JwtService $jwtService,
        private UserRepository $userRepository,
    ) {
    }

    public function supports(Request $request): ?bool
    {
        return str_starts_with(
            $request->headers->get('Authorization', ''),
            'Bearer '
        );
    }

    public function authenticate(Request $request): SelfValidatingPassport
    {
        $authHeader = $request->headers->get('Authorization');

        if (!$authHeader || !preg_match('/^Bearer\s+(.+)$/', $authHeader, $matches)) {
            throw new AuthenticationException('Header Authorization inválido');
        }

        $jwt = $matches[1];

        try {
            $claims = $this->jwtService->validate($jwt);
        } catch (\Throwable $e) {
            throw new AuthenticationException('JWT inválido ou expirado');
        }

        if (!isset($claims['sub'])) {
            throw new AuthenticationException('JWT sem subject');
        }

        return new SelfValidatingPassport(
            new UserBadge(
                $claims['sub'],
                fn (): UserInterface => $this->userRepository->findOneBy([
                    'id' => $claims['sub'],
                ]) ?? throw new AuthenticationException('Usuário não encontrado')
            )
        );
    }

    public function onAuthenticationSuccess(
        Request $request,
        TokenInterface $token,
        string $firewallName,
    ): ?Response {
        return null;
    }

    public function onAuthenticationFailure(
        Request $request,
        AuthenticationException $exception,
    ): ?Response {
        return new Response('Unauthorized', 401);
    }
}
