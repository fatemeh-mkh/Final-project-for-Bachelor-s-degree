package com.example.Internship.DTO;

import lombok.Data;
import java.util.List; // اضافه کردن import

@Data
public class JobAdvertisementCreateUpdateDTO {
    private String title;
    private String description;
    // --- تغییر زیر ---
    private List<String> skills; // تغییر از String به List<String>
    // --- پایان تغییر ---
    private String benefits;
    private String duration;
    private Boolean active;
}
