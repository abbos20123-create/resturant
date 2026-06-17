"use client";

import "@/app/globals.css";
import { createClient } from "@/utilis/supabase/clientComponents";
import { useEffect, useState } from "react";
import Rodal from "rodal";
import "rodal/lib/rodal.css";

type Food = {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  categoryId: number;
};

type Category = {
  id: number;
  name: string;
};

export default function Home() {
  const supabase = createClient();

  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [visible, setVisible] = useState(false);

  // Separate filter state from form entry state to prevent database bugs
  const [selectedCategory, setSelectedCategory] = useState<number | "All">("All");
  const [categoryName, setCategoryName] = useState("");

  // Food Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);
  const [foodCategory, setFoodCategory] = useState<number | "">("");

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    getData();
    getCategories();
  }, []);

  const getData = async () => {
    const { data, error } = await supabase.from("food").select("*").order("id");
    if (error) {
      console.error(error);
      return;
    }
    setFoods(data || []);
  };

  const getCategories = async () => {
    const { data, error } = await supabase.from("category").select().order("id");
    if (error) {
      console.error(error);
      return;
    }
    setCategories(data || []);
  };

  const addFood = async () => {
    if (!name || !price || !foodCategory) return alert("Iltimos, barcha maydonlarni to'ldiring");

    const { error } = await supabase.from("food").insert({
      name,
      price: Number(price),
      description,
      image,
      available,
      categoryId: Number(foodCategory),
    });

    if (error) {
      console.error(error);
      return;
    }

    clearForm();
    getData();
  };

  const addCategory = async () => {
    if (!categoryName.trim()) return;
    const { error } = await supabase.from("category").insert({
      name: categoryName,
    });

    if (error) {
      console.error(error);
      return;
    }

    setCategoryName("");
    getCategories();
  };

  const deleteFood = async (id: number) => {
    if (!confirm("Haqiqatdan ham bu taomni o'chirmoqchimisiz?")) return;
    const { error } = await supabase.from("food").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    getData();
  };

  const startEdit = (food: Food) => {
    setEditingId(food.id);
    setName(food.name);
    setPrice(food.price);
    setDescription(food.description);
    setImage(food.image);
    setAvailable(food.available);
    setFoodCategory(food.categoryId);
    setVisible(true);
  };

  const updateFood = async () => {
    if (!editingId || !foodCategory) return;

    const { error } = await supabase.from("food")
      .update({
        name,
        price: Number(price),
        description,
        image,
        available,
        categoryId: Number(foodCategory),
      })
      .eq("id", editingId);

    if (error) {
      console.error(error);
      return;
    }

    clearForm();
    getData();
  };

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDescription("");
    setImage("");
    setAvailable(true);
    setFoodCategory("");
    setVisible(false);
  };

  const filterFoodsByCategory = () => {
    if (selectedCategory === "All") {
      return foods;
    }
    return foods.filter((food: Food) => food.categoryId === selectedCategory);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Header / Top Dashboard Bar */}
        <header className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm backdrop-blur-md mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <input
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                type="text"
                className="w-full pl-4 pr-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl transition duration-200 outline-none text-sm placeholder:text-slate-400"
                placeholder="Yangi kategoriya..."
              />
            </div>
            <button
              onClick={addCategory}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-sm font-medium rounded-2xl shadow-sm shadow-indigo-500/10 transition duration-200 cursor-pointer whitespace-nowrap"
            >
              Kategoriya Qo'shish
            </button>
          </div>

          <button
            onClick={() => { clearForm(); setVisible(true); }}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white text-sm font-medium rounded-2xl shadow-sm transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Taom Qo'shish
          </button>
        </header>

        {/* Categories Pills Filter */}
        <section className="mb-8 overflow-x-auto no-scrollbar py-1">
          <div className="flex gap-2 items-center whitespace-nowrap">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition duration-200 cursor-pointer border ${
                selectedCategory === "All"
                  ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              All Menu
            </button>
            {categories.map((category: Category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2 rounded-xl text-sm font-medium transition duration-200 cursor-pointer border ${
                  selectedCategory === category.id
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Food Items Grid Grid */}
        <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterFoodsByCategory().map((food: Food) => (
            <article
              key={food.id}
              className="group bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"}
                  alt={food.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span
                  className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md border ${
                    food.available
                      ? "bg-emerald-500/90 text-white border-emerald-400/20"
                      : "bg-rose-500/90 text-white border-rose-400/20"
                  }`}
                >
                  {food.available ? "Mavjud" : "Tugagan"}
                </span>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition">
                    {food.name}
                  </h2>
                  <p className="text-xl font-black text-indigo-600 shrink-0">
                    {food.price.toLocaleString()} <span className="text-sm font-semibold text-slate-500">so'm</span>
                  </p>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-6 flex-1">
                  {food.description || "Taom haqida qo'shimcha ma'lumot berilmagan."}
                </p>

                <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
                  <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                    ID: #{food.id}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(food)}
                      className="p-2.5 px-4 bg-slate-50 hover:bg-amber-500 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition duration-200 cursor-pointer flex items-center gap-1.5"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => deleteFood(food.id)}
                      className="p-2.5 px-4 bg-slate-50 hover:bg-rose-500 hover:text-white text-slate-600 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </main>
      </div>

      {/* Styled Management Dialog (Rodal) */}
      <Rodal
        customStyles={{
          height: "auto",
          maxHeight: "90vh",
          width: "92%",
          maxWidth: "480px",
          padding: "24px 28px",
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
        }}
        visible={visible}
        onClose={clearForm}
        animation="zoom"
      >
        <div className="flex flex-col h-full">
          <div className="mb-5">
            <h3 className="text-xl font-bold text-slate-900">
              {editingId ? "Taomni Tahrirlash" : "Yangi Taom Qo'shish"}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">Barcha forma maydonlarini diqqat bilan toldiring</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Taom nomi</label>
              <input
                placeholder="Masalan: Lavash Max"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="modern-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Narxi (so'm)</label>
                <input
                  type="number"
                  placeholder="Narx"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  className="modern-input"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Kategoriya</label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value === "" ? "" : Number(e.target.value))}
                  className="modern-select"
                >
                  <option value="">Tanlang...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Rasm Linki (URL)</label>
              <input
                placeholder="https://image-source.com/food.jpg"
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="modern-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 tracking-wider">Taom Tarifi</label>
              <textarea
                placeholder="Tarkibi, og'irligi va h.k."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="modern-input h-20 resize-none py-2"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-sm font-semibold text-slate-700">Omborda mavjudligi</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-indigo-500/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={clearForm}
                className="flex-1 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-98 rounded-xl font-semibold text-sm transition cursor-pointer"
              >
                Bekor Qilish
              </button>
              {editingId ? (
                <button
                  onClick={updateFood}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white active:scale-98 rounded-xl font-semibold text-sm shadow-md shadow-indigo-500/10 transition cursor-pointer"
                >
                  Saqlash
                </button>
              ) : (
                <button
                  onClick={addFood}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98 rounded-xl font-semibold text-sm shadow-md shadow-emerald-500/10 transition cursor-pointer"
                >
                  Tasdiqlash
                </button>
              )}
            </div>
          </div>
        </div>
      </Rodal>
    </div>
  );
}