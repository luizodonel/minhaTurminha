package com.minhaturminha.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fotos_personalizadas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FotoPersonalizada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crianca_id", nullable = false)
    @JsonIgnore
    private Crianca crianca;

    @NotBlank(message = "O rótulo ou nome da pessoa/objeto é obrigatório")
    @Column(nullable = false, length = 100)
    private String rotulo;

    @Column(nullable = false, length = 500)
    private String urlOriginal;

    @Column(nullable = false, length = 500)
    private String urlThumb;

    @Column(length = 50)
    @Builder.Default
    private String categoria = "FAMILIA"; // FAMILIA, PET, BRINQUEDO, AMIGO, OUTROS

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.categoria == null || this.categoria.isBlank()) {
            this.categoria = "FAMILIA";
        }
    }
}
