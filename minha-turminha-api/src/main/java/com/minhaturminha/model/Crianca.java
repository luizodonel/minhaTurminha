package com.minhaturminha.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "criancas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Crianca {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", length = 100)
    private String deviceId;

    @NotBlank(message = "O nome da criança é obrigatório")
    @Column(nullable = false, length = 100)
    private String nome;

    private Integer idade;

    @Column(length = 500)
    private String avatarUrl;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "crianca", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("crianca")
    @Builder.Default
    private List<FotoPersonalizada> fotos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.avatarUrl == null || this.avatarUrl.isBlank()) {
            this.avatarUrl = "avatar-default.png";
        }
    }
}
