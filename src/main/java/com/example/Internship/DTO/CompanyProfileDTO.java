package com.example.Internship.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyProfileDTO {
    private Long id;
    private String name;
    private String industry;
    private String location;
    private String website;

    private String about;
    private String logoUrl;
    private String coverUrl;
    private String email;
    private String phone;
    private String address;
    private Integer foundedYear;
    private Integer employeeCount;
}
