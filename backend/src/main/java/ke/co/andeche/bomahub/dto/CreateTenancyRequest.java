package ke.co.andeche.bomahub.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CreateTenancyRequest {
    private Long propertyId;
    private List<Long> unitIds;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String idNumber;
    private String emergencyContact;
    private Double monthlyRent;
    private LocalDate startDate;
}