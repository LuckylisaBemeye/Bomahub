package ke.co.andeche.bomahub.services;

import ke.co.andeche.bomahub.dto.CreateTenancyRequest;
import ke.co.andeche.bomahub.models.*;
import ke.co.andeche.bomahub.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UnitTenancyService {
    private final UnitTenancyRepository unitTenancyRepository;
    private final UnitRepository unitRepository;
    private final TenantRepository tenantRepository;
    private final PropertyRepository propertyRepository;
    private final PaymentRepository paymentRepository;


    @Autowired
    public UnitTenancyService(
            UnitTenancyRepository unitTenancyRepository,
            UnitRepository unitRepository,
            TenantRepository tenantRepository,
            PropertyRepository propertyRepository,
            PaymentRepository paymentRepository
            ) {
        this.unitTenancyRepository = unitTenancyRepository;
        this.unitRepository = unitRepository;
        this.tenantRepository = tenantRepository;
        this.paymentRepository = paymentRepository;
        this.propertyRepository = propertyRepository;
    }

    public List<UnitTenancy> getAllUnitTenancies() {
        return unitTenancyRepository.findAll();
    }

    public List<UnitTenancy> getUnitTenanciesByProperty(Long propertyId) {
        return unitTenancyRepository.findByPropertyId(propertyId);
    }

    public List<UnitTenancy> getUnitTenanciesByTenant(Long tenantId) {
        return unitTenancyRepository.findByTenantId(tenantId);
    }

    public List<UnitTenancy> getUnitTenanciesByUnit(Long unitId) {
        return unitTenancyRepository.findByUnitId(unitId);
    }

    public Optional<UnitTenancy> getActiveUnitTenancy(Long unitId) {
        return unitTenancyRepository.findByUnitIdAndStatus(unitId, "active");
    }

    public Optional<UnitTenancy> getUnitTenancyById(Long id) {
        return unitTenancyRepository.findById(id);
    }

    @Transactional
    public UnitTenancy createUnitTenancy(UnitTenancy unitTenancy) {
        Optional<Unit> unitOpt = unitRepository.findById(unitTenancy.getUnit().getId());
        if (unitOpt.isPresent()) {
            Unit unit = unitOpt.get();
            unit.setStatus("occupied");
            unitRepository.save(unit);
        }
        return unitTenancyRepository.save(unitTenancy);
    }

    @Transactional
    public UnitTenancy updateUnitTenancy(UnitTenancy unitTenancy) {
        return unitTenancyRepository.save(unitTenancy);
    }

    @Transactional
    public void endTenancy(Long id) {
        Optional<UnitTenancy> tenancyOpt = unitTenancyRepository.findById(id);
        if (tenancyOpt.isPresent()) {
            UnitTenancy tenancy = tenancyOpt.get();
            tenancy.setStatus("ended");
            unitTenancyRepository.save(tenancy);

            Unit unit = tenancy.getUnit();
            unit.setStatus("available");
            unitRepository.save(unit);
        }
    }

    public void deleteUnitTenancy(Long id) {
        unitTenancyRepository.deleteById(id);
    }

    @Transactional
    public Long createCompleteTenancy(CreateTenancyRequest request) {
        // Create tenant
        Tenant tenant = new Tenant();
        tenant.setName(request.getFirstName() + " " + request.getLastName());
        tenant.setEmail(request.getEmail());
        tenant.setPhone(request.getPhone());
        tenant.setIdNumber(request.getIdNumber());
        tenant.setEmergencyContact(request.getEmergencyContact());

        // Set property
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));
        tenant.setProperty(property);

        Tenant savedTenant = tenantRepository.save(tenant);

        // Create unit tenancies for each unit
        for (Long unitId : request.getUnitIds()) {
            Unit unit = unitRepository.findById(unitId)
                    .orElseThrow(() -> new RuntimeException("Unit not found: " + unitId));

            // Check if unit is available
            if (!"available".equals(unit.getStatus())) {
                throw new RuntimeException("Unit " + unit.getUnitNumber() + " is not available");
            }

            // Create unit tenancy
            UnitTenancy tenancy = new UnitTenancy();
            tenancy.setTenant(savedTenant);
            tenancy.setUnit(unit);
            tenancy.setProperty(property);
            tenancy.setMonthlyRent(request.getMonthlyRent());
            tenancy.setStartDate(request.getStartDate());
            tenancy.setStatus("active");

            unitTenancyRepository.save(tenancy);

            // Update unit status
            unit.setStatus("occupied");
            unitRepository.save(unit);

            // Create pending payments (deposit and first month)
            createPendingPayments(tenancy, request.getMonthlyRent());
        }

        return savedTenant.getId();
    }

    private void createPendingPayments(UnitTenancy tenancy, Double monthlyRent) {
        // Create deposit payment
        Payment deposit = new Payment();
        deposit.setUnitTenancy(tenancy);
        deposit.setProperty(tenancy.getProperty());
        deposit.setAmount(monthlyRent); // Assuming deposit = 1 month rent
        deposit.setDescription("Security Deposit - Unit " + tenancy.getUnit().getUnitNumber());
        deposit.setPaymentStatus("pending");
        deposit.setDueDate(tenancy.getStartDate());

        paymentRepository.save(deposit);

        // Create first month rent payment
        Payment rent = new Payment();
        rent.setUnitTenancy(tenancy);
        rent.setProperty(tenancy.getProperty());
        rent.setAmount(monthlyRent);
        rent.setDescription("Rent - " + tenancy.getStartDate().getMonth() + " " + tenancy.getStartDate().getYear());
        rent.setPaymentStatus("pending");
        rent.setDueDate(tenancy.getStartDate().plusDays(5)); // Due 5 days after start

        paymentRepository.save(rent);
    }
}
