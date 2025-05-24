package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.services.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;


@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final UnitService unitService;
    private final TenantService tenantService;
    private final PaymentService paymentService;

    @Autowired
    public DashboardController(
            UnitService unitService,
            TenantService tenantService,
            PaymentService paymentService) {
        this.unitService = unitService;
        this.tenantService = tenantService;
        this.paymentService = paymentService;
    }

    @GetMapping("/property/{propertyId}/stats")
    public Map<String, Object> getPropertyStats(@PathVariable Long propertyId) {
        Map<String, Object> stats = new HashMap<>();

        // Get unit statistics
        long totalUnits = unitService.getUnitsByProperty(propertyId).size();
        long availableUnits = unitService.countByPropertyAndStatus(propertyId, "available");
        long occupiedUnits = unitService.countByPropertyAndStatus(propertyId, "occupied");
        long occupancyRate = (totalUnits > 0) ? (occupiedUnits * 100 / totalUnits) : 0;

        stats.put("totalUnits", totalUnits);
        stats.put("availableUnits", availableUnits);
        stats.put("occupiedUnits", occupiedUnits);
        stats.put("occupancyRate", occupancyRate);

        // Get tenant count
        long tenantCount = tenantService.getTenantsByProperty(propertyId).size();
        stats.put("tenantCount", tenantCount);

        // Get payment statistics
        long pendingPayments = paymentService.getPaymentsByPropertyAndStatus(propertyId, "pending").size();
        long completedPayments = paymentService.getPaymentsByPropertyAndStatus(propertyId, "paid").size();
        long overduePayments = paymentService.getPaymentsByPropertyAndStatus(propertyId, "overdue").size();

        stats.put("pendingPayments", pendingPayments);
        stats.put("completedPayments", completedPayments);
        stats.put("overduePayments", overduePayments);

        return stats;
    }
}
