const API_BASE = "http://localhost:8080/api/experiences";

let expId = null;
const userId = localStorage.getItem("userId") || 1; // موقت اگر لاگین نداری

const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const ratingInput = document.getElementById("rating");
const ratingLabel = document.getElementById("ratingLabel");


// نمایش مقدار rating
ratingInput.addEventListener("input", () => {
  ratingLabel.innerText = ratingInput.value;
});


// لود اطلاعات تجربه برای ادیت
window.addEventListener("DOMContentLoaded", async () => {

  const params = new URLSearchParams(window.location.search);
  expId = params.get("id");

  if (!expId) {
    alert("شناسه تجربه پیدا نشد");
    return;
  }

  try {

    const res = await fetch(`${API_BASE}/${expId}`);

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }

    const exp = await res.json();

    titleInput.value = exp.title ?? "";
    descriptionInput.value = exp.description ?? "";
    ratingInput.value = exp.rating ?? 3;
    ratingLabel.innerText = exp.rating ?? 3;
    startDateInput.value = exp.startDate ?? "";
    endDateInput.value = exp.endDate ?? "";

  } catch (err) {
    console.error(err);
    alert("خطا در بارگذاری تجربه");
  }

});


// ذخیره تغییرات
async function updateExperience() {

  const data = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    rating: Number(ratingInput.value),
    startDate: startDateInput.value,
    endDate: endDateInput.value
  };

  try {

    const res = await fetch(`${API_BASE}/${expId}?userId=${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(text);
      alert("خطای سرور:\n" + text);
      return;
    }

    alert("✅ تغییرات ذخیره شد");
    window.location.href = "index.html";

  } catch (err) {
    console.error(err);
    alert("خطا در ارتباط با سرور");
  }

}
