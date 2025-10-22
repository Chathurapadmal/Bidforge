import Link from "next/link";

import { FaFacebook, FaWhatsapp, FaLinkedin ,FaInstagram } from "react-icons/fa";



export default function Footer() {

  return (

    <footer className="bg-white dark:bg-background-dark border-t border-gray-200 dark:border-border-dark mt-10">

      <div className="max-w-6xl mx-auto px-6 py-10 text-center">





        <p className="text-gray-700 dark:text-text-mutedDark max-w-3xl mx-auto mb-8">

          BidForge is a specialized online auction platform dedicated to

          connecting buyers and sellers of spare parts worldwide. With

          real-time bidding, detailed listings, and a secure marketplace,

          BidForge ensures that deals are forged and spare parts find

          their new home.

        </p>





        <p className="text-lg font-medium text-gray-900 dark:text-text-dark mb-4">

          contact us via social media

        </p>

        <div className="flex justify-center gap-6 mb-8">

          <Link href="https://facebook.com" target="_blank">

            <FaFacebook className="w-7 h-7 text-blue-600 hover:scale-110 transition" />

          </Link>

          <Link href="https://wa.me/123456789" target="_blank">

            <FaWhatsapp className="w-7 h-7 text-green-500 hover:scale-110 transition" />

          </Link>

                    <Link href="https://wa.me/123456789" target="_blank">

            <FaLinkedin className="w-7 h-7 text-blue-500 hover:scale-110 transition" />

          </Link>

         

<Link href="https://instagram.com/yourprofile" target="_blank">
  <FaInstagram className="w-7 h-7 text-pink-500 hover:scale-110 transition" />
</Link>


        </div>



        <div className="border-t border-blue-300 dark:border-border-dark pt-4">

          <p className="text-sm text-gray-500 dark:text-gray-400">

            All Rights Reserved by <span className="font-bold">BidForge™</span>

          </p>

        </div>

      </div>

    </footer>

  );

}


