package com.minhaturminha.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CardMemoriaDTO {
    private String id;
    private Long parId;
    private String rotulo;
    private String urlThumb;
}
