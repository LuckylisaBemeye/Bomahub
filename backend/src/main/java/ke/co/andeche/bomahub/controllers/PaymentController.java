package ke.co.andeche.bomahub.controllers;

import ke.co.andeche.bomahub.dto.PaymentRequest;
import ke.co.andeche.bomahub.models.Payment;
import ke.co.andeche.bomahub.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/unit-tenancy/{unitTenancyId}")
    public List<Payment> getPaymentsByUnitTenancy(@PathVariable Long unitTenancyId) {
        return paymentService.getPaymentsByUnitTenancy(unitTenancyId);
    }

    @GetMapping("/property/{propertyId}")
    public List<Payment> getPaymentsByProperty(@PathVariable Long propertyId) {
        return paymentService.getPaymentsByProperty(propertyId);
    }

    @GetMapping("/property/{propertyId}/status/{status}")
    public List<Payment> getPaymentsByPropertyAndStatus(
            @PathVariable Long propertyId,
            @PathVariable String status) {
        return paymentService.getPaymentsByPropertyAndStatus(propertyId, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> updatePayment(@PathVariable Long id, @RequestBody Payment payment) {
        return paymentService.getPaymentById(id)
                .map(existingPayment -> {
                    payment.setId(id);
                    return ResponseEntity.ok(paymentService.updatePayment(payment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        String newStatus = statusUpdate.get("status");
        if (newStatus == null || newStatus.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return paymentService.getPaymentById(id)
                .map(existingPayment -> {
                    existingPayment.setPaymentStatus(newStatus);
                    return ResponseEntity.ok(paymentService.updatePayment(existingPayment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .map(payment -> {
                    paymentService.deletePayment(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/process-payment")
    public ResponseEntity<Map<String, Object>> processPayment(
            @RequestBody PaymentRequest request) {
        try {
            List<Long> paymentIds = paymentService.processPayment(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paymentIds", paymentIds);
            response.put("message", "Payment processed successfully");

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error processing payment: " + e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
