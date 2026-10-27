package com.minhaturminha.controller;

import com.minhaturminha.dto.JogoMemoriaSetupDTO;
import com.minhaturminha.dto.PartidaRequestDTO;
import com.minhaturminha.model.PartidaJogo;
import com.minhaturminha.service.JogoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jogos")
@RequiredArgsConstructor
public class JogoController {

    private final JogoService jogoService;

    private String resolveDeviceId(String headerDeviceId, String paramDeviceId) {
        if (headerDeviceId != null && !headerDeviceId.isBlank()) {
            return headerDeviceId.trim();
        }
        if (paramDeviceId != null && !paramDeviceId.isBlank()) {
            return paramDeviceId.trim();
        }
        return null;
    }

    @GetMapping("/memoria/setup")
    public ResponseEntity<JogoMemoriaSetupDTO> setupMemoria(
            @RequestParam(value = "criancaId", defaultValue = "1") Long criancaId,
            @RequestParam(value = "pares", defaultValue = "6") int pares,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        JogoMemoriaSetupDTO setup = jogoService.gerarJogoMemoria(criancaId, pares, deviceId);
        return ResponseEntity.ok(setup);
    }

    @PostMapping("/partida")
    public ResponseEntity<?> salvarPartida(
            @Valid @RequestBody PartidaRequestDTO partidaRequest,
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        try {
            String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
            PartidaJogo partida = jogoService.registrarPartida(partidaRequest, deviceId);
            return ResponseEntity.status(HttpStatus.CREATED).body(partida);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
