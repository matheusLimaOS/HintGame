<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class GeminiService
{
    public function __construct(
        private HttpClientInterface $httpClient,
    ) {
    }

    public function generateCardTips(string $category, string $cardsCategory): array
    {
        $prompt = $this->buildPrompt($category, $cardsCategory);
        $response = $this->httpClient->request('POST', 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', [
            'headers' => [
                'X-goog-api-key' => $_ENV['GEMINI_API_KEY'],
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ],
        ]);

        $data = $response->toArray();

        $text = $data['candidates'][0]['content']['parts'][0]['text'];
        $text = preg_replace('/```json|```/i', '', $text);
        $text = trim($text);
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');

        try {
            $result = json_decode($text, true, 512, JSON_THROW_ON_ERROR);

            return $result;
        } catch (\JsonException $e) {
            dd($e);
            throw new \RuntimeException('Resposta inválida da IA');
        }
    }

    private function buildPrompt(string $category, string $cardsCategory): string
    {
        return <<<PROMPT
            Você é um gerador de cartas para um jogo estilo "Perfil".

            Categoria: {$category}

            Regras:
            - Gere EXATAMENTE 20 dicas
            - Evite repetir informações
            - A última dica deve tornar a resposta óbvia
            - Não use emojis
            - Retorne o resultado em JSON válido
            - Não fale a resposta no meio das dicas, apenas na chave "resposta"
            - Mescle dicas boas e ruins para aumentar a dificuldade
            - Limite cada dica a 100 caracteres
            - Não crie dicas que sejam perguntas
            - Deve ser diferente das cartas já existentes

            Já possui estas cartas criadas para as seguinte categoria: ( {$cardsCategory} )

            Formato de saída:
            {
            "resposta": "resposta",
            "dicas": [
                "texto da dica 1",
                "...",
                "texto da dica 20"
            ]
            }
        PROMPT;
        // return `Você é um gerador de cartas para um jogo estilo "Perfil". Categoria: { $categoria } Regras: - Gere EXATAMENTE 20 dicas - As dicas devem ser progressivas, do genérico para o específico - Não revele nomes próprios antes da dica 15 - Evite repetir informações - A última dica deve tornar a resposta óbvia - Não use emojis - Retorne o resultado em JSON válido Formato de saída: { "dicas": [ "texto da dica 1", ... "texto da dica 20"]}     }`;
    }
}
