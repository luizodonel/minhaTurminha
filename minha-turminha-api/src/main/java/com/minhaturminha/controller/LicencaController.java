package com.minhaturminha.controller;

import com.minhaturminha.model.DispositivoLicenca;
import com.minhaturminha.repository.DispositivoLicencaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/licenca")
@RequiredArgsConstructor
public class LicencaController {

    private final DispositivoLicencaRepository licencaRepository;

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
    public ResponseEntity<Map<String, Object>> consultarLicenca(
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        Map<String, Object> resp = new HashMap<>();
        resp.put("deviceId", deviceId);
        resp.put("precoVitalicio", 9.90);

        if (deviceId == null) {
            resp.put("isPro", false);
            return ResponseEntity.ok(resp);
        }

        return licencaRepository.findByDeviceId(deviceId)
                .map(lic -> {
                    resp.put("isPro", Boolean.TRUE.equals(lic.getIsPro()));
                    resp.put("plano", lic.getPlano());
                    resp.put("valorPago", lic.getValorPago());
                    resp.put("activatedAt", lic.getActivatedAt());
                    return ResponseEntity.ok(resp);
                })
                .orElseGet(() -> {
                    resp.put("isPro", false);
                    return ResponseEntity.ok(resp);
                });
    }

    @PostMapping("/ativar")
    public ResponseEntity<?> ativarPro(
            @RequestHeader(value = "X-Device-Id", required = false) String headerDeviceId,
            @RequestParam(value = "deviceId", required = false) String paramDeviceId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        String deviceId = resolveDeviceId(headerDeviceId, paramDeviceId);
        if (deviceId == null) {
            return ResponseEntity.badRequest().body("Cabeçalho X-Device-Id é obrigatório");
        }

        String purchaseToken = body != null && body.get("purchaseToken") != null
                ? String.valueOf(body.get("purchaseToken"))
                : "PLAYSTORE_LIFETIME_990";

        DispositivoLicenca licenca = licencaRepository.findByDeviceId(deviceId)
                .orElseGet(() -> DispositivoLicenca.builder()
                        .deviceId(deviceId)
                        .build());

        licenca.setIsPro(true);
        licenca.setPlano("VITALICIO");
        licenca.setValorPago(9.90);
        licenca.setPurchaseToken(purchaseToken);
        licenca.setActivatedAt(LocalDateTime.now());

        DispositivoLicenca salva = licencaRepository.save(licenca);
        return ResponseEntity.ok(salva);
    }
}

