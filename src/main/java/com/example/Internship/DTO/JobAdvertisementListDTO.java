package com.example.Internship.DTO;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

// DTO برای نمایش آگهی در لیست داشبورد
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobAdvertisementListDTO {
    private Long id;
    private String title;
    private List<String> skills;
    private Integer applicantCount;
    private boolean active;
    private Date createdAt;
}
