package com.example.Internship.DTO;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data // این annotation باید وجود داشته باشد
@Builder // این annotation را اضافه کنید
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private long activeAds;
    private long totalApplicants;
    private long pendingReviews;
    private long accepted;
    private int messages;
}
