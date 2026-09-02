document.addEventListener('DOMContentLoaded', function() {
    const applyForm = document.getElementById('applyForm');
    
    // تابع کمکی برای گرفتن پارامتر از URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // گرفتن jobId از URL
    const jobIdFromUrl = getQueryParam('jobId'); 

    // اگر jobId رو نتونستیم پیدا کنیم، خطا بده و فرم رو غیرفعال کن
    if (!jobIdFromUrl) {
        alert('شناسه موقعیت شغلی مشخص نیست. لطفاً مطمئن شوید که از طریق لینک صحیح وارد شده‌اید.');
        const submitButton = applyForm.querySelector('.btn-submit-apply');
        if(submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'خطا: شناسه موقعیت شغلی نامعتبر';
        }
        // جلوگیری از ادامه اجرای اسکریپت اگر jobId نباشد
        return; 
    }

    // اگر jobId پیدا شد، اون رو در input مخفی قرار بده (برای اطمینان)
    const jobIdInput = document.getElementById('jobId');
    if (jobIdInput) {
        jobIdInput.value = jobIdFromUrl;
    } else {
        console.warn("Input hidden for jobId not found, but jobId was extracted from URL.");
    }

    // اضافه کردن event listener برای دکمه submit فرم
    applyForm.addEventListener('submit', function(event) {
        event.preventDefault(); // جلوگیری از ارسال فرم پیش‌فرض

        // گرفتن مقادیر دیگر فیلدهای فرم
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value; 
        const coverLetter = document.getElementById('coverLetter').value;
        // const note = document.getElementById('note') ? document.getElementById('note').value : ''; // اگر note را اضافه کردید

        // ساختن آبجکت داده برای ارسال به بک‌اند
        const applicantData = {
            jobId: parseInt(jobIdFromUrl), // اطمینان از اینکه jobId عدد است
            fullName: fullName,
            email: email,
            phone: phone, // نام فیلد باید با بک‌اند یکی باشد (phone)
            coverLetter: coverLetter
            // note: note // اگر note را اضافه کردید
        };

        // ارسال درخواست به بک‌اند با استفاده از fetch API
        fetch('/api/public/applicants/apply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicantData),
        })
        .then(response => {
            // بررسی اینکه آیا پاسخ از سرور موفقیت آمیز بوده است (status code 2xx)
            if (!response.ok) {
                // اگر پاسخ خطا بود، متن خطا را بخوان و یک Exception ایجاد کن
                return response.text().then(text => { throw new Error(text || response.statusText) });
            }
            // اگر موفق بود، پاسخ JSON را بخوان
            return response.json(); 
        })
        .then(data => {
            // در صورت موفقیت آمیز بودن درخواست
            console.log('درخواست با موفقیت ارسال شد:', data);
            alert('درخواست شما با موفقیت ارسال شد!');
            applyForm.reset(); // پاک کردن فرم پس از ارسال موفق
        })
        .catch((error) => {
            // در صورت بروز هرگونه خطا در طول ارسال یا پردازش پاسخ
            console.error('خطا در ارسال درخواست:', error);
            alert('خطا در ارسال درخواست: ' + error.message);
        });
    });
});
