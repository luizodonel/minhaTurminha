package com.minhaturminha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "partidas_jogos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartidaJogo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crianca_id", nullable = false)
    @JsonIgnoreProperties({"fotos", "hibernateLazyInitializer", "handler"})
    private Crianca crianca;

    @Column(nullable = false, length = 50)
    private String tipoJogo; // MEMORIA, QUEBRA_CABECA, QUEM_E_QUEM, STICKERS

    private Integer pontuacao;

    private Integer tempoSegundos;

    private Integer tentativas;

    @Column(name = "data_partida")
    private LocalDateTime dataPartida;

    @PrePersist
    public void prePersist() {
        if (this.dataPartida == null) {
            this.dataPartida = LocalDateTime.now();
        }
    }
}
