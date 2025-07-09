package ke.co.andeche.bomahub.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class PaymentRequest {
    private Long tenantId;
    private List<Long> pendingPaymentIds;
    private Double amount;
    private LocalDate paymentDate;
    private String paymentMethod;
    private String referenceNumber;
    private String description;
}