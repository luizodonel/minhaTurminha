package com.minhaturminha.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivos_licencas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DispositivoLicenca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false, unique = true, length = 100)
    private String deviceId;

    @Column(name = "is_pro", nullable = false)
    @Builder.Default
    private Boolean isPro = false;

    @Column(length = 50)
    @Builder.Default
    private String plano = "VITALICIO";

    @Column(name = "valor_pago")
    @Builder.Default
    private Double valorPago = 9.90;

    @Column(name = "purchase_token", length = 255)
    private String purchaseToken;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @PrePersist
    public void prePersist() {
        if (this.activatedAt == null && Boolean.TRUE.equals(this.isPro)) {
            this.activatedAt = LocalDateTime.now();
        }
    }
}

