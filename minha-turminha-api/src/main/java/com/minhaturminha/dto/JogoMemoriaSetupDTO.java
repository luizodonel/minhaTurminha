package com.minhaturminha.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JogoMemoriaSetupDTO {
    private Long criancaId;
    private String criancaNome;
    private int totalPares;
    private List<CardMemoriaDTO> cards;
}
