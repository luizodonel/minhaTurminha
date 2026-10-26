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

    @GetMapping
    public ResponseEntity<List<CriancaDTO>> listarTodas() {
        return ResponseEntity.ok(criancaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Crianca> buscarPorId(@PathVariable Long id) {
        return criancaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Crianca> criar(@Valid @RequestBody Crianca crianca) {
        Crianca salva = criancaService.salvar(crianca);
        return ResponseEntity.status(HttpStatus.CREATED).body(salva);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        criancaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
