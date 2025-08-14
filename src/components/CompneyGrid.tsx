import React from "react";

interface Company {
  name: string;
  logo: string;
}

const companies: Company[] = [
  { name: "King Koil", logo: "https://kingkoil.in/images/logo.png" },
  { name: "Skill Nation", logo: "https://skillnation.ai/wp-content/uploads/2023/08/SN_logo-17-1024x415.png" },
  { name: "Mintree", logo: "https://mintree.in/cdn/shop/files/Mintree_Logo_3c7e9336-d594-41ef-abbd-610791bfb90b.png?v=1706126721&width=160" },
  { name: "Karmic_Beauty", logo: "https://karmicbeauty.in/cdn/shop/files/KB_Logo_3_1_1.png?v=1746429952&width=160" },
  { name: "Just_dial", logo: "https://akam.cdn.jdmagicbox.com/images/icontent/jdrwd/jdlogosvg.svg" },
  { name: "Nooky", logo: "https://www.trynooky.in/cdn/shop/files/nooky-logo.png?v=1717756521&width=110" },
  { name: "yourhappylife", logo: "https://yourhappylife.com/cdn/shop/files/yhl_logo_black_d4410096-644a-48ec-a005-bd064a13c715.png?v=1674815249&width=400" },
  { name: "WholeLeaf", logo: "https://www.wholeleaf.in/cdn/shop/files/bigger_350x.png?v=1626441182" },
  { name: "GoWheelo", logo: "https://gobikes-prod-public.s3.ap-south-1.amazonaws.com/uploads/admin/site/d95fb648-07d3-473d-8804-bd9b72471e4f.png" },
  { name: "SitaRam", logo: "https://sitaramayurveda.com/cdn/shop/files/Group.svg?height=48&v=1750397855" },
  { name: "QuackQuack", logo: "https://cdn8.quackquack.in/qq_logo-228x49.webp" },
  { name: "K9Vitality", logo: "https://k9vitality.in/cdn/shop/files/k9Vitality_250_x_88_px_1.png?v=1751609935&width=250" },
  { name: "ArabianAroma", logo: "https://arabianaroma.in/cdn/shop/files/Untitled_design_20.png?v=1723009418&width=280" },
  { name: "AsliGems", logo: "https://asligems.com/cdn/shop/files/Asligems_Logo_190x.png?v=1742450951" },
  { name: "ChoclateX", logo: "https://m.media-amazon.com/images/I/41rAvluPZ8L._SX300_SY300_QL70_FMwebp_.jpg" },



];

const CompanyGrid: React.FC = () => {
  return (
    <div className="py-10 bg-gray-50">
      

       <div className="grid grid-cols-5 gap-4 items-center max-w-6xl mx-auto px-4">
        {companies.map((company) => (
          <div
            key={company.name}
            className="flex justify-center items-center p-2 sm:p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <img
              src={company.logo}
              alt={`${company.name} logo`}
              className="h-10 sm:h-12 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyGrid;
