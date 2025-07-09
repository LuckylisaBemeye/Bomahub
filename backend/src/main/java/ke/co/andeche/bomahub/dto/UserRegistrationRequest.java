package ke.co.andeche.bomahub.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Data
public class UserRegistrationRequest {
    // Getters and setters
    private String username;
    private String password;
    private String email;
    private String name;
    private String role;
    private String verificationCode;

    // Default constructor
    public UserRegistrationRequest() {}

}
