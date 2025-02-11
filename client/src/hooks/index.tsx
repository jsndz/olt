import { WebContainer } from "@webcontainer/api";
import { useEffect, useState } from "react";

export const useWebContainer = () => {
  const [webcontainer, setWebcontainer] = useState<WebContainer>();

  async function main() {
    const webcontainerInstance = await WebContainer.boot();
    setWebcontainer(webcontainer);
  }
  useEffect(() => {
    main();
  }, []);
  return webcontainer;
};
