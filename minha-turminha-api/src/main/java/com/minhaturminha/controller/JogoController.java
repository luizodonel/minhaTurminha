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

    @GetMapping("/memoria/setup")
    public ResponseEntity<JogoMemoriaSetupDTO> setupMemoria(
            @RequestParam(value = "criancaId", defaultValue = "1") Long criancaId,
            @RequestParam(value = "pares", defaultValue = "6") int pares
    ) {
        JogoMemoriaSetupDTO setup = jogoService.gerarJogoMemoria(criancaId, pares);
        return ResponseEntity.ok(setup);
    }

    @PostMapping("/partida")
    public ResponseEntity<PartidaJogo> salvarPartida(@Valid @RequestBody PartidaRequestDTO partidaRequest) {
        PartidaJogo partida = jogoService.registrarPartida(partidaRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(partida);
    }
}
