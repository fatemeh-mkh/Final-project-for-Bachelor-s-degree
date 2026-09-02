const EXPERIENCE_API = "http://localhost:8080/api/experiences";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

async function getExperience(id) {
    try {
        const response = await fetch(`${EXPERIENCE_API}/${id}`);
        if (!response.ok) throw new Error("خطا در دریافت اطلاعات تجربه");
        return await response.json();
    } catch(e) {
        console.error(e);
        return null;
    }
}

function formatDuration(start, end) {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    if (isNaN(startDate)) return "";

    let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    months -= startDate.getMonth();
    months += endDate.getMonth();

    return months > 0 ? months + " ماه" : "کمتر از یک ماه";
}

function renderRatingCircle(rating, element) {
    // می‌توان استایل دایره‌ای با پر شدن رنگ به نسبت مقدار امتیاز اضافه کرد
    // ساده: متن امتیاز با آیکون ساختمان
    element.innerHTML = `<i class="fas fa-building"></i><br><strong>${rating.toFixed(1)} / 5</strong>`;
}

async function loadDetails() {
    if (!id) {
        alert("آی‌دی تجربه مشخص نیست.");
        window.location.href = "index.html";
        return;
    }

    const exp = await getExperience(id);
    if (!exp) {
        alert("خطا در بارگذاری تجربه.");
        return;
    }

    document.getElementById("expTitle").innerText = exp.title || "";
    document.getElementById("expCompany").innerText = exp.company ? exp.company.name : (exp.companyName || "—");
    document.getElementById("expDescription").innerText = exp.description || "";

    // امتیاز کلی تجربه در دایره
    renderRatingCircle(exp.rating || 0, document.getElementById("expRating"));

    document.getElementById("infoCompany").innerText = exp.company ? exp.company.name : (exp.companyName || "—");
    document.getElementById("infoStart").innerText = exp.startDate || "نامشخص";
    document.getElementById("infoEnd").innerText = exp.endDate || "نامشخص";

    document.getElementById("infoDuration").innerText = formatDuration(exp.startDate, exp.endDate);
}

document.addEventListener("DOMContentLoaded", loadDetails);
