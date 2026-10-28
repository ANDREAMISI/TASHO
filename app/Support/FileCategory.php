<?php

namespace App\Support;

/**
 * Répartition unique des fichiers par famille MIME.
 *
 * La même logique est utilisée en SQL (agrégats, filtres) et en PHP
 * (affichage d'un fichier), afin d'éviter les écarts entre le comptage
 * et l'affichage.
 */
class FileCategory
{
    public const IMAGES = 'images';
    public const VIDEOS = 'videos';
    public const DOCUMENTS = 'documents';
    public const AUDIO = 'audio';
    public const ARCHIVES = 'archives';
    public const OTHERS = 'others';

    /**
     * Libellés affichés dans l'interface (ordre d'affichage inclus).
     */
    public const LABELS = [
        self::IMAGES => 'Images',
        self::VIDEOS => 'Vidéos',
        self::DOCUMENTS => 'Documents',
        self::AUDIO => 'Audio',
        self::ARCHIVES => 'Archives',
        self::OTHERS => 'Autres',
    ];

    /**
     * Expression SQL renvoyant la clé de catégorie d'un fichier.
     */
    public static function expression(string $column = 'mime_type'): string
    {
        return <<<SQL
            CASE
                WHEN {$column} LIKE 'image/%' THEN 'images'
                WHEN {$column} LIKE 'video/%' THEN 'videos'
                WHEN {$column} LIKE 'audio/%' THEN 'audio'
                WHEN {$column} LIKE 'application/pdf'
                    OR {$column} LIKE 'application/msword'
                    OR {$column} LIKE 'application/vnd.openxmlformats-officedocument%'
                    OR {$column} LIKE 'application/vnd.ms-%'
                    OR {$column} LIKE 'application/rtf'
                    OR {$column} LIKE 'text/%' THEN 'documents'
                WHEN {$column} LIKE 'application/zip'
                    OR {$column} LIKE 'application/x-rar%'
                    OR {$column} LIKE 'application/x-7z%'
                    OR {$column} LIKE 'application/gzip'
                    OR {$column} LIKE 'application/x-tar' THEN 'archives'
                ELSE 'others'
            END
            SQL;
    }

    /**
     * Catégorie d'un type MIME (même logique que l'expression SQL).
     */
    public static function for(?string $mimeType): string
    {
        $mime = strtolower(trim((string) $mimeType));

        if ($mime === '') {
            return self::OTHERS;
        }

        if (str_starts_with($mime, 'image/')) {
            return self::IMAGES;
        }

        if (str_starts_with($mime, 'video/')) {
            return self::VIDEOS;
        }

        if (str_starts_with($mime, 'audio/')) {
            return self::AUDIO;
        }

        if (self::isDocument($mime)) {
            return self::DOCUMENTS;
        }

        if (self::isArchive($mime)) {
            return self::ARCHIVES;
        }

        return self::OTHERS;
    }

    public static function label(?string $mimeType): string
    {
        return self::LABELS[self::for($mimeType)] ?? self::LABELS[self::OTHERS];
    }

    public static function isKnown(string $category): bool
    {
        return array_key_exists($category, self::LABELS);
    }

    private static function isDocument(string $mime): bool
    {
        return $mime === 'application/pdf'
            || $mime === 'application/msword'
            || $mime === 'application/rtf'
            || str_starts_with($mime, 'application/vnd.openxmlformats-officedocument')
            || str_starts_with($mime, 'application/vnd.ms-')
            || str_starts_with($mime, 'text/');
    }

    private static function isArchive(string $mime): bool
    {
        return $mime === 'application/zip'
            || str_starts_with($mime, 'application/x-rar')
            || str_starts_with($mime, 'application/x-7z')
            || $mime === 'application/gzip'
            || $mime === 'application/x-tar';
    }
}
