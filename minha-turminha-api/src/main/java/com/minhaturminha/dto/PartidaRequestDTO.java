package com.minhaturminha.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartidaRequestDTO {
    @NotNull(message = "O ID da criança é obrigatório")
    private Long criancaId;

    @NotBlank(message = "O tipo do jogo é obrigatório")
    private String tipoJogo;

    private Integer pontuacao;
    private Integer tempoSegundos;
    private Integer tentativas;
}
