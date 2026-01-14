import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/app/ClientLayout";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sathya School | CBSE Pattern | PreKG to 5th Std | Quality Education & Co-curricular Activities",
  description: "Sathya School, a CBSE pattern air-conditioned school in Rajapalayam, Melalangaarathattu, offering quality education from PreKG to 5th Std. Nurturing minds with interactive atmosphere, limited strength for individual attention, activity-based learning, and computer lab facilities. Admission open for sports and co-curricular activities including Karate, Silambam, Bharatha Naatiyam, Western Dance, Art & Craft, Singing & Music, and Cookery.",
  icons: {
    icon: "/user/sathya-school-logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
        {/* ✅ Tracking Script */}
        <Script id="adtarbo-tracking" strategy="afterInteractive">
          {`(function(dd, ss, idd) {
              var js, ajs = dd.getElementsByTagName(ss)[0];
              if (dd.getElementById(idd)) {return;}
              js = dd.createElement(ss);
              js.id = idd;
              js.aun_id = "DxxR7VDj28N7";
              js.src = "https://pixel.adtarbo.com/pixelTrack1.js";
              ajs.parentNode.insertBefore(js, ajs);
          }(document, 'script', 'adtarbo-js-v2'));`}
        </Script>
         {/*insta_video */}
        <Script async src="https://www.instagram.com/embed.js"></Script>
      </body>
    </html>
  );
}
