import Layout from "../../components/Layout/Layout";
import AvailableMaterials from "../../components/AvailableMaterials/AvailableMaterials";
import FeatureHeader from "../../components/FeatureHeader/FeatureHeader";
import Header from "../../components/Header/Header";

export const UploadeMaterialsPage = () => {
  return (
    <>
      <Layout>
        <Header />
        <FeatureHeader />
        <AvailableMaterials />
      </Layout>
    </>
  );
};
