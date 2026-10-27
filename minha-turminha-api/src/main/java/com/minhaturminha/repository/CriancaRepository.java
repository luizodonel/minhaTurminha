package com.minhaturminha.repository;

import com.minhaturminha.model.Crianca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CriancaRepository extends JpaRepository<Crianca, Long> {
    List<Crianca> findByDeviceIdOrderByIdAsc(String deviceId);
    Optional<Crianca> findByIdAndDeviceId(Long id, String deviceId);
    boolean existsByIdAndDeviceId(Long id, String deviceId);
}
