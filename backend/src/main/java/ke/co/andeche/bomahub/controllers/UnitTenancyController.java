package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.dto.CreateTenancyRequest;
import ke.co.andeche.bomahub.models.UnitTenancy;
import ke.co.andeche.bomahub.services.UnitTenancyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/unit-tenancy")
public class UnitTenancyController {
    private final UnitTenancyService unitTenancyService;

    @Autowired
    public UnitTenancyController(UnitTenancyService unitTenancyService) {
        this.unitTenancyService = unitTenancyService;
    }

    @GetMapping
    public List<UnitTenancy> getAllUnitTenancies() {
        return unitTenancyService.getAllUnitTenancies();
    }

    @GetMapping("/property/{propertyId}")
    public List<UnitTenancy> getUnitTenanciesByProperty(@PathVariable Long propertyId) {
        return unitTenancyService.getUnitTenanciesByProperty(propertyId);
    }

    @GetMapping("/tenant/{tenantId}")
    public List<UnitTenancy> getUnitTenanciesByTenant(@PathVariable Long tenantId) {
        return unitTenancyService.getUnitTenanciesByTenant(tenantId);
    }

    @GetMapping("/unit/{unitId}")
    public List<UnitTenancy> getUnitTenanciesByUnit(@PathVariable Long unitId) {
        return unitTenancyService.getUnitTenanciesByUnit(unitId);
    }

    @GetMapping("/unit/{unitId}/active")
    public ResponseEntity<UnitTenancy> getActiveUnitTenancy(@PathVariable Long unitId) {
        return unitTenancyService.getActiveUnitTenancy(unitId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitTenancy> getUnitTenancyById(@PathVariable Long id) {
        return unitTenancyService.getUnitTenancyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UnitTenancy createUnitTenancy(@RequestBody UnitTenancy unitTenancy) {
        return unitTenancyService.createUnitTenancy(unitTenancy);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitTenancy> updateUnitTenancy(@PathVariable Long id, @RequestBody UnitTenancy unitTenancy) {
        return unitTenancyService.getUnitTenancyById(id)
                .map(existingTenancy -> {
                    unitTenancy.setId(id);
                    return ResponseEntity.ok(unitTenancyService.updateUnitTenancy(unitTenancy));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/end")
    public ResponseEntity<Void> endTenancy(@PathVariable Long id) {
        return unitTenancyService.getUnitTenancyById(id)
                .map(tenancy -> {
                    unitTenancyService.endTenancy(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnitTenancy(@PathVariable Long id) {
        return unitTenancyService.getUnitTenancyById(id)
                .map(unitTenancy -> {
                    unitTenancyService.deleteUnitTenancy(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/create-complete")
    public ResponseEntity<Map<String, Object>> createCompleteTenancy(
            @RequestBody CreateTenancyRequest request) {
        try {
            Long tenantId = unitTenancyService.createCompleteTenancy(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tenantId", tenantId);
            response.put("message", "Tenancy created successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating tenancy: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
