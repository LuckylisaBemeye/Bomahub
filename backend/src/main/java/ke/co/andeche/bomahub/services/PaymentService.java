package ke.co.andeche.bomahub.services;

import ke.co.andeche.bomahub.dto.PaymentRequest;
import ke.co.andeche.bomahub.models.Payment;
import ke.co.andeche.bomahub.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {
    private final PaymentRepository paymentRepository;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public List<Payment> getPaymentsByUnitTenancy(Long unitTenancyId) {
        return paymentRepository.findByUnitTenancyId(unitTenancyId);
    }

    public List<Payment> getPaymentsByProperty(Long propertyId) {
        return paymentRepository.findByPropertyId(propertyId);
    }

    public List<Payment> getPaymentsByPropertyAndStatus(Long propertyId, String status) {
        return paymentRepository.findByPropertyIdAndPaymentStatus(propertyId, status);
    }

    public Optional<Payment> getPaymentById(Long id) {
        return paymentRepository.findById(id);
    }

    public Payment createPayment(Payment payment) {
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }
        return paymentRepository.save(payment);
    }

   // Modify the existing updatePayment or processPayment method in PaymentService
   public Payment updatePayment(Payment payment) {
       Payment savedPayment = paymentRepository.save(payment);

       // If payment status changed to paid, schedule next payment
       if ("paid".equals(savedPayment.getPaymentStatus())) {
           scheduleNextRentPayment(savedPayment);
       }

       return savedPayment;
   }

    public void deletePayment(Long id) {
        paymentRepository.deleteById(id);
    }

    @Transactional
    public List<Long> processPayment(PaymentRequest request) {
        List<Long> processedPaymentIds = new ArrayList<>();

        // Validate that pending payments belong to the tenant
        for (Long paymentId : request.getPendingPaymentIds()) {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found: " + paymentId));

            if (!payment.getUnitTenancy().getTenant().getId().equals(request.getTenantId())) {
                throw new RuntimeException("Payment does not belong to the specified tenant");
            }

            // Update payment status
            updatePaymentStatus(paymentId, "paid", request);

            processedPaymentIds.add(payment.getId());
        }

        return processedPaymentIds;
    }

    // Add to PaymentService or modify existing updatePaymentStatus method
    public void updatePaymentStatus(Long id, String status, PaymentRequest request) {
        Payment payment = getPaymentById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        String previousStatus = payment.getPaymentStatus();
        payment.setPaymentStatus(status);

        if ("paid".equals(status) && !"paid".equals(previousStatus)) {

            payment.setPaymentDate(request.getPaymentDate());
            payment.setPaymentMethod(request.getPaymentMethod());
            payment.setReferenceNumber(request.getReferenceNumber());

            Payment savedPayment = paymentRepository.save(payment);
            scheduleNextRentPayment(savedPayment);
            return;
        }

        paymentRepository.save(payment);
    }

    // Add to PaymentService
    public void scheduleNextRentPayment(Payment paidPayment) {
        // Only schedule next payment if this is a rent payment (not a deposit)
        if (paidPayment.getDescription() != null &&
                paidPayment.getDescription().toLowerCase().contains("rent")) {

            Payment nextPayment = new Payment();
            nextPayment.setAmount(paidPayment.getAmount());
            nextPayment.setDescription("Monthly Rent");
            nextPayment.setPaymentStatus("pending");

            // Set due date to 30 days after the current payment's due date
            nextPayment.setDueDate(paidPayment.getDueDate().plusDays(30));

            // Copy references to related entities
            nextPayment.setUnitTenancy(paidPayment.getUnitTenancy());
            nextPayment.setProperty(paidPayment.getProperty());

            // Save the new payment
            paymentRepository.save(nextPayment);

        }
    }
}
