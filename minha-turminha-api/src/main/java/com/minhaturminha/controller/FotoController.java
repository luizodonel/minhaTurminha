package com.minhaturminha.controller;

import com.minhaturminha.model.FotoPersonalizada;
import com.minhaturminha.service.FotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FotoController {

    private final FotoService fotoService;

    private String resolveDeviceId(String headerDeviceId, String paramDeviceId) {
        if (headerDeviceId != null && !headerDeviceId.isBlank()) {
            return headerDeviceId.trim();
        }
        if (paramDeviceId != null && !paramDeviceId.isBlank()) {
            return paramDeviceId.trim();
        }
        return null;
    }

    @GetMapping("/criancas/{criancaId}/fotos")
    public ResponseEntity<List<FotoPersonalizada>> listarFotos(
            @PathVariable Long criancaId,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        return ResponseEntity.ok(fotoService.listarPorCrianca(criancaId, deviceId));
    }

    @PostMapping(value = "/criancas/{criancaId}/fotos", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadFoto(
            @PathVariable Long criancaId,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId,
            @RequestParam("rotulo") String rotulo,
            @RequestParam(value = "categoria", defaultValue = "FAMILIA") String categoria,
            @RequestParam("arquivo") MultipartFile arquivo
    ) {
        try {
            String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
            FotoPersonalizada salva = fotoService.adicionarFoto(criancaId, deviceId, rotulo, categoria, arquivo);
            return ResponseEntity.status(HttpStatus.CREATED).body(salva);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar imagem: " + e.getMessage());
        }
    }

    @DeleteMapping("/fotos/{fotoId}")
    public ResponseEntity<Void> removerFoto(
            @PathVariable Long fotoId,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        fotoService.removerFoto(fotoId, deviceId);
        return ResponseEntity.noContent().build();
    }
}
