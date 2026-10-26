package com.minhaturminha.service;

import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:uploads}")
    private String uploadBaseDir;

    public static class StoredFilePaths {
        public final String originalUrl;
        public final String thumbUrl;

        public StoredFilePaths(String originalUrl, String thumbUrl) {
            this.originalUrl = originalUrl;
            this.thumbUrl = thumbUrl;
        }
    }

    public StoredFilePaths storePhoto(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio não pode ser armazenado");
        }

        Path photosPath = Paths.get(uploadBaseDir, "photos");
        Path thumbsPath = Paths.get(uploadBaseDir, "thumbs");

        Files.createDirectories(photosPath);
        Files.createDirectories(thumbsPath);

        String originalFilename = file.getOriginalFilename();
        String extension = ".jpg";
        if (originalFilename != null && originalFilename.lastIndexOf('.') != -1) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
        }

        String uniqueName = UUID.randomUUID().toString() + extension;
        Path targetPhoto = photosPath.resolve(uniqueName);
        Path targetThumb = thumbsPath.resolve(uniqueName);

        // Salva a foto original
        Files.copy(file.getInputStream(), targetPhoto, StandardCopyOption.REPLACE_EXISTING);

        // Gera a miniatura quadrada (300x300) com corte centralizado perfeito para os cards
        try {
            Thumbnails.of(targetPhoto.toFile())
                    .crop(Positions.CENTER)
                    .size(320, 320)
                    .outputQuality(0.85)
                    .toFile(targetThumb.toFile());
        } catch (Exception e) {
            // Fallback caso seja formato incompatível com crop: copia o original como thumb
            Files.copy(targetPhoto, targetThumb, StandardCopyOption.REPLACE_EXISTING);
        }

        return new StoredFilePaths("/uploads/photos/" + uniqueName, "/uploads/thumbs/" + uniqueName);
    }

    public boolean deletePhoto(String url) {
        if (url == null || !url.startsWith("/uploads/")) return false;
        try {
            String relativePath = url.substring("/uploads/".length());
            Path file = Paths.get(uploadBaseDir).resolve(relativePath);
            return Files.deleteIfExists(file);
        } catch (Exception e) {
            return false;
        }
    }
}
