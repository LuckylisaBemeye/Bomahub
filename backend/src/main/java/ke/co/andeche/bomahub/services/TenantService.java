package ke.co.andeche.bomahub.services;

import ke.co.andeche.bomahub.models.Tenant;
import ke.co.andeche.bomahub.repositories.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TenantService {
    private final TenantRepository tenantRepository;

    @Autowired
    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }

    public List<Tenant> getTenantsByProperty(Long propertyId) {
        return tenantRepository.findByPropertyId(propertyId);
    }

    public Optional<Tenant> getTenantById(Long id) {
        return tenantRepository.findById(id);
    }

    public Optional<Tenant> getTenantByIdNumber(String idNumber) {
        return tenantRepository.findByIdNumber(idNumber);
    }

    public Optional<Tenant> getTenantByEmail(String email) {
        return tenantRepository.findByEmail(email);
    }

    public Tenant createTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    public Tenant updateTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }

    public void deleteTenant(Long id) {
        tenantRepository.deleteById(id);
    }
}
