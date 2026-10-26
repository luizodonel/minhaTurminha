package com.minhaturminha.service;

import net.coobird.thumbnailator.Thumbnails;
import net.coobird.thumbnailator.geometry.Positions;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

@Service
public class FileStorageService {

    public static class StoredFilePaths {
        public final String originalUrl;
        public final String thumbUrl;

        public StoredFilePaths(String originalUrl, String thumbUrl) {
            this.originalUrl = originalUrl;
            this.thumbUrl = thumbUrl;
        }
    }

    public StoredFilePaths storePhoto(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio não pode ser armazenado");
        }

        byte[] rawBytes = file.getBytes();
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            contentType = "image/jpeg";
        }

        String rawBase64 = "data:" + contentType + ";base64," + Base64.getEncoder().encodeToString(rawBytes);

        String thumbBase64;
        String originalBase64;

        try {
            // Gera thumbnail quadrada 320x320 com corte centralizado perfeito para os cards de memória
            ByteArrayOutputStream thumbOut = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .crop(Positions.CENTER)
                    .size(320, 320)
                    .outputFormat("jpg")
                    .outputQuality(0.85)
                    .toOutputStream(thumbOut);
            thumbBase64 = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(thumbOut.toByteArray());
        } catch (Exception e) {
            thumbBase64 = rawBase64;
        }

        try {
            // Otimiza imagem original mantendo proporção (máx 800x800) para economizar dados
            ByteArrayOutputStream origOut = new ByteArrayOutputStream();
            Thumbnails.of(file.getInputStream())
                    .size(800, 800)
                    .outputFormat("jpg")
                    .outputQuality(0.85)
                    .toOutputStream(origOut);
            originalBase64 = "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(origOut.toByteArray());
        } catch (Exception e) {
            originalBase64 = rawBase64;
        }

        return new StoredFilePaths(originalBase64, thumbBase64);
    }

    public boolean deletePhoto(String url) {
        // Ao salvar direto no PostgreSQL (Base64), a exclusão do registro no banco remove a foto definitivamente
        return true;
    }
}
