package com.minhaturminha.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CriancaDTO {
    private Long id;
    private String nome;
    private Integer idade;
    private String avatarUrl;
    private int totalFotos;
}
