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
@RequestMapping("/api/tenancies")
public class UnitTenancyController {
    private final UnitTenancyService unitTenancyService;

    @Autowired
    public UnitTenancyController(UnitTenancyService unitTenancyService) {
        this.unitTenancyService = unitTenancyService;
    }

    @GetMapping
    public ResponseEntity<List<UnitTenancy>> getAllTenancies() {
        return ResponseEntity.ok(unitTenancyService.getAllTenancies());
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<UnitTenancy>> getTenanciesByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(unitTenancyService.getTenanciesByProperty(propertyId));
    }

    @GetMapping("/unit/{unitId}")
    public ResponseEntity<List<UnitTenancy>> getTenanciesByUnit(@PathVariable Long unitId) {
        return ResponseEntity.ok(unitTenancyService.getTenanciesByUnit(unitId));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<UnitTenancy>> getTenanciesByTenant(@PathVariable Long tenantId) {
        return ResponseEntity.ok(unitTenancyService.getTenanciesByTenant(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UnitTenancy> getTenancyById(@PathVariable Long id) {
        return unitTenancyService.getTenancyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createTenancy(@RequestBody CreateTenancyRequest request) {
        try {
            UnitTenancy createdTenancy = unitTenancyService.createTenancy(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tenancy created successfully");
            response.put("tenancy", createdTenancy);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error creating tenancy: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UnitTenancy> updateTenancy(@PathVariable Long id, @RequestBody UnitTenancy tenancy) {
        return unitTenancyService.getTenancyById(id)
                .map(existingTenancy -> {
                    tenancy.setId(id);
                    return ResponseEntity.ok(unitTenancyService.updateTenancy(tenancy));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/terminate")
    public ResponseEntity<Map<String, Object>> terminateTenancy(@PathVariable Long id) {
        try {
            unitTenancyService.terminateTenancy(id);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tenancy terminated successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error terminating tenancy: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenancy(@PathVariable Long id) {
        return unitTenancyService.getTenancyById(id)
                .map(tenancy -> {
                    unitTenancyService.deleteTenancy(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
