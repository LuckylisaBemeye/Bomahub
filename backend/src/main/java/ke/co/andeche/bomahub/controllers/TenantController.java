package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.models.Tenant;
import ke.co.andeche.bomahub.services.TenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
public class TenantController {
    private final TenantService tenantService;

    @Autowired
    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantService.getAllTenants();
    }

    @GetMapping("/property/{propertyId}")
    public List<Tenant> getTenantsByProperty(@PathVariable Long propertyId) {
        return tenantService.getTenantsByProperty(propertyId);
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
    public Tenant createTenant(@RequestBody Tenant tenant) {
        return tenantService.createTenant(tenant);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable Long id, @RequestBody Tenant tenant) {
        return tenantService.getTenantById(id)
                .map(existingTenant -> {
                    tenant.setId(id);
                    return ResponseEntity.ok(tenantService.updateTenant(tenant));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        return tenantService.getTenantById(id)
                .map(tenant -> {
                    tenantService.deleteTenant(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
