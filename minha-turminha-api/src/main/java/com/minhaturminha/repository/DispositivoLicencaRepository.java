package com.minhaturminha.repository;

import com.minhaturminha.model.DispositivoLicenca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DispositivoLicencaRepository extends JpaRepository<DispositivoLicenca, Long> {
    Optional<DispositivoLicenca> findByDeviceId(String deviceId);
}

