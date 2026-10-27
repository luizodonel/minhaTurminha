package com.minhaturminha.controller;

import com.minhaturminha.dto.CriancaDTO;
import com.minhaturminha.model.Crianca;
import com.minhaturminha.service.CriancaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/criancas")
@RequiredArgsConstructor
public class CriancaController {

    private final CriancaService criancaService;

    private String resolveDeviceId(String headerDeviceId, String paramDeviceId) {
        if (headerDeviceId != null && !headerDeviceId.isBlank()) {
            return headerDeviceId.trim();
        }
        if (paramDeviceId != null && !paramDeviceId.isBlank()) {
            return paramDeviceId.trim();
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<List<CriancaDTO>> listarTodas(
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        return ResponseEntity.ok(criancaService.listarPorDispositivo(deviceId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Crianca> buscarPorId(
            @PathVariable Long id,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        return criancaService.buscarPorIdEDispositivo(id, deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> criar(
            @Valid @RequestBody Crianca crianca,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        if (deviceId == null) {
            return ResponseEntity.badRequest().body("Cabeçalho X-Device-Id é obrigatório");
        }
        Crianca salva = criancaService.salvar(crianca, deviceId);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Crianca> atualizar(
            @PathVariable Long id,
            @RequestBody Crianca crianca,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        return criancaService.atualizar(id, crianca, deviceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(
            @PathVariable Long id,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        boolean deletado = criancaService.deletar(id, deviceId);
        if (!deletado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}
