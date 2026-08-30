package com.example.Internship.Controller;

import com.example.Internship.DTO.ExperienceRequestDTO;
import com.example.Internship.DTO.ExperienceResponseDTO;
import com.example.Internship.Service.InternshipExperienceService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/experiences")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class InternshipExperienceController {

    private final InternshipExperienceService service;

    public InternshipExperienceController(InternshipExperienceService service) {
        this.service = service;
    }

    // ---------------------- GET ALL ----------------------
    @GetMapping
    public ResponseEntity<List<ExperienceResponseDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // ---------------------- GET BY ID  ----------------------
    @GetMapping("/{id}")
    public ResponseEntity<ExperienceResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // ---------------------- CREATE ----------------------
    @PostMapping
    public ResponseEntity<ExperienceResponseDTO> create(
            @Valid @RequestBody ExperienceRequestDTO dto,
            @RequestParam Long userId,
            @RequestParam Long companyId
    ) {
        return ResponseEntity.ok(service.create(dto, userId, companyId));
    }

    // ---------------------- FILTER BY COMPANY ----------------------
    @GetMapping("/by-company/{companyId}")
    public ResponseEntity<List<ExperienceResponseDTO>> byCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(service.getByCompany(companyId));
    }

    // ---------------------- FILTER BY USER ----------------------
    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<ExperienceResponseDTO>> byUser(@PathVariable Long userId) {
        return ResponseEntity.ok(service.getByUser(userId));
    }

    // ---------------------- MULTI FILTER ----------------------
    @GetMapping("/filter")
    public ResponseEntity<List<ExperienceResponseDTO>> filter(
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) String startDate
    ) {

        if (rating != null)
            return ResponseEntity.ok(service.getByRating(rating));

        if (startDate != null)
            return ResponseEntity.ok(service.getByStartDateAfter(LocalDate.parse(startDate)));

        // default fallback
        return ResponseEntity.ok(service.getPaginated(0, 10).getContent());
    }

    // ---------------------- PAGINATION ----------------------
    @GetMapping("/paginated")
    public ResponseEntity<Page<ExperienceResponseDTO>> paginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(service.getPaginated(page, size));
    }

    // ---------------------- UPDATE ----------------------
    @PutMapping("/{id}")
    public ResponseEntity<ExperienceResponseDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody ExperienceRequestDTO dto,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(service.update(id, dto, userId));
    }

    // ---------------------- DELETE ----------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

}
