package com.hrleave.repository;

import com.hrleave.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(User.Role role);
    
    List<User> findByDepartment(String department);
    
    @Query("SELECT u FROM User u WHERE u.manager.id = :managerId")
    List<User> findByManagerId(@Param("managerId") Long managerId);
    
    @Query("SELECT u FROM User u WHERE u.role = :role AND u.department = :department")
    List<User> findByRoleAndDepartment(@Param("role") User.Role role, @Param("department") String department);
}