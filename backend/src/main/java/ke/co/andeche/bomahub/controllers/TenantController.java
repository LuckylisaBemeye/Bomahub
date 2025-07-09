package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.models.Tenant;
import ke.co.andeche.bomahub.services.TenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantService tenantService;

    @Autowired
    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> getAllTenants() {
        return ResponseEntity.ok(tenantService.getAllTenants());
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<Tenant>> getTenantsByProperty(@PathVariable Long propertyId) {
        return ResponseEntity.ok(tenantService.getTenantsByProperty(propertyId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable Long id) {
        return tenantService.getTenantById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/id-number/{idNumber}")
    public ResponseEntity<Tenant> getTenantByIdNumber(@PathVariable String idNumber) {
        return tenantService.getTenantByIdNumber(idNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Tenant> getTenantByEmail(@PathVariable String email) {
        return tenantService.getTenantByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Tenant> createTenant(@RequestBody Tenant tenant) {
        try {
            Tenant createdTenant = tenantService.createTenant(tenant);
            return ResponseEntity.ok(createdTenant);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable Long id, @RequestBody Tenant tenant) {
        Optional<Tenant> existingTenant = tenantService.getTenantById(id);
        if (existingTenant.isPresent()) {
            tenant.setId(id);
            try {
                Tenant updatedTenant = tenantService.updateTenant(tenant);
                return ResponseEntity.ok(updatedTenant);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteTenant(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            tenantService.deleteTenant(id);
            response.put("success", true);
            response.put("message", "Tenant deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
