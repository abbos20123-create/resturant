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
};

export default function Home() {
  const supabase = createClient();

  const [foods, setFoods] = useState<Food[]>([]);

  const [visible,setVisible] = useState(false)

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [available, setAvailable] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const { data, error } = await supabase.from("food").select("*").order("id");

    if (error) {
      console.log(error);
      return;
    }

    setFoods(data || []);
  };


  const addFood = async () => {
    const { error } = await supabase.from("food").insert({
      name,
      price,
      description,
      image,
      available,
    });

    if (error) {
      console.log(error);
      return;
    }

    clearForm();
    getData();
  };

  const deleteFood = async (id: number) => {
    const { error } = await supabase.from("food").delete().eq("id", id);

    if (error) {
      console.log(error);
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
    setVisible((true))
  };

  const updateFood = async () => {
    if (!editingId) return;

    const { error } = await supabase.from("food")
      .update({
        name,
        price,
        description,
        image,
        available,
      })
      .eq("id", editingId);

    if (error) {
      console.log(error);
      return;
    }

    clearForm();
    getData();
  };

  const clearForm = () => {
    setEditingId(null);
    setName("");
    setPrice(0);
    setDescription("");
    setImage("");
    setAvailable(true);
    setVisible(false)
  };

  return (
    <div className="p-6">
      
      <div className="flex justify-end items-center p-2 px-3 mb-5">
        <button onClick={()=>setVisible(true)} className="px-3 py-2 hover:bg-black/70 rounded-2xl bg-black text-white  transition duration-150 cursor-pointer">+Food</button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {foods.map((food:Food) => (
          <div
          style={{transition:"300ms"}}
            key={food.id}
            className="bg-white hover:scale-101  rounded-3xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition"
          >
            <div className="relative">
              <img
                src={food.image}
                alt={food.name}
                className="w-full h-56 object-cover"
              />

              <div
                className={`absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-semibold shadow
      ${food.available
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                  }`}
              >
                {food.available ? "Available" : "Not Available"}
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  {food.name}
                </h2>

                <p className="text-2xl font-semibold text-slate-800">
                  {food.price.toLocaleString()} so'm
                </p>
              </div>

              <p className="mt-4 text-gray-500 text-lg line-clamp-2">
                {food.description}
              </p>

              <div className="flex justify-between items-center mt-8">
                <p className="text-gray-400 text-lg">
                  ID: f-{food.id}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(food)}
                    className="px-6 py-2 rounded-2xl  bg-amber-400 text-white font-semibold shadow-sm hover:bg-amber-300 duration-100 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteFood(food.id)}
                    className="px-6 py-2 cursor-pointer rounded-2xl border border-red-200 bg-white font-semibold text-red-600 shadow-sm hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Rodal customStyles={{
        height: "400px",
        padding: "35px",
        paddingTop: "50px",
        backgroundColor: "#1a1a1a",
        borderRadius: "30px",
      }} visible={visible} onClose={clearForm}>
        <div className="flex flex-col gap-3 max-w-md mb-8">
          <input
            placeholder="Food Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            name="name"
          />

          <input
            type="text"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="input"
          />

          <input
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />

          <input
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="input"
          />

          <label className="text-white flex gap-2">
            Available
            <input
              type="checkbox"
              checked={available}
              onChange={(e) => setAvailable(e.target.checked)}
            />
          </label>









          {editingId ? (
            <button
              onClick={updateFood}
              className="bg-blue-500 text-white p-2 rounded"
            >
              Update Food
            </button>
          ) : (
            <button
              onClick={addFood}
              className="bg-green-500 text-white p-2 rounded"
            >
              Add Food
            </button>
          )}
        </div>
      </Rodal>

    </div>
  );
}