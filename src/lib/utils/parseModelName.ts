export const select_modelname = (modelname: string) => {
  let firstname = modelname.split(" ")[0];
  let color = modelname.match(/(?<=\()\w+(?=\))/)!;
  switch (firstname) {
    case "SPR":
      if (/5000/.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "SPR 50 ADD (" + color[0][0] + ")";
        } else {
          return "SPR 5000";
        }
      } else if (/5100/.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "SPR 51 ADD (" + color[0][0] + ")";
        } else {
          return "SPR 5100";
        }
      } else if (/5200/.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "SPR 52 ADD (" + color[0][0] + ")";
        } else {
          return "SPR 5200";
        }
      } else {
        if (/camo/i.test(modelname)) {
          return "SPR 53 ADD (" + color[0][0] + ")";
        } else {
          return "SPR 5300";
        }
      }

    case "B/L":
      if (/tx/i.test(modelname)) {
        return "B/L TX ONLY";
      } else {
        return "B/L RX ONLY";
      }

    case "BARKBOSS":
      if (/rpl/i.test(modelname)) {
        return "BBOSS (RPL)";
      } else {
        return "BBOSS (RCH)";
      }

    case "H2O":
      if (/1820/.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "H2O 1820 ADD (" + color[0][0] + ")";
        } else {
          return "H2O 1820 PLUS";
        }
      } else if (/1850/.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "H2O 1850 ADD (" + color[0][0] + ")";
        } else {
          return "H2O 1850 PLUS";
        }
      } else {
        if (/add-on rx/i.test(modelname)) {
          return "H2O C ADD (" + color[0][0] + ")";
        } else {
          return "H2O 1820 CAMO";
        }
      }

    case "IDT":
      if (/eu/i.test(modelname)) {
        return "IDT (EU)";
      } else {
        if (/add-on rx/i.test(modelname)) {
          let color = modelname.match(/(?<=\()\w+(?=\))/)!;
          return "IDT ADD(" + color[0][0] + ")";
        } else {
          return "IDT";
        }
      }
    case "D.O.G":
      if (/DIRECTOR/i.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "DD ADD(" + color[0][0] + ")";
        } else {
          return "DD 700";
        }
      }
      break;
    case "SPT":
      if (/20/.test(modelname)) {
        return "SPT 2420";
      } else if (/22/.test(modelname)) {
        return "SPT 2422";
      } else if (/30/.test(modelname)) {
        return "SPT 2430";
      } else {
        return "SPT 2432";
      }

    case "MR":
      if (/camo/i.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "MR CAMO ADD";
        } else {
          return "MR CAMO";
        }
      } else {
        if (/add-on rx/i.test(modelname)) {
          let color = modelname.match(/(?<=\()\w+(?=\))/)!;
          return "MR ADD(" + color[0][0] + ")";
        } else {
          return "MR";
        }
      }

    case "DD":
      if (/add-on rx/i.test(modelname)) {
        return "DD 700 ADD(" + color[0][0] + ")";
      } else {
        return "DD 700";
      }

    case "BTB":
      if (/800/.test(modelname)) {
        let beep = modelname.match(/(?<=\()\w+(?=\))/)!;
        return "BTB 800 (" + beep[0][0] + ")";
      } else {
        let beep = modelname.match(/(?<=\()\w+(?=\))/)!;
        return "BTB 809 (" + beep[0][0] + ")";
      }

    case "CAB":
    case "FFH":
    case "CC":
      return modelname;

    case "R.A.P.T":
      if (/coverup/i.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "RAPT C ADD (" + color[0][0] + ")";
        } else {
          return "RAPT 1400 C";
        }
      } else if (/1400/.test(modelname)) {
        if (/add-on rx/i.test(modelname)) {
          return "RAPT ADD (" + color[0][0] + ")";
        } else {
          return "RAPT 1400";
        }
      } else {
        if (/add-on rx/i.test(modelname)) {
          return "RAPT 1450 ADD (" + color[0][0] + ")";
        } else {
          return "RAPT 1450";
        }
      }

    case "BL":
      if (/505/.test(modelname)) {
        return "BL 505";
      } else if (/509/.test(modelname)) {
        return "BL 509";
      } else if (/705/.test(modelname)) {
        return "BL 705";
      } else {
        return "BL 709";
      }

    case "DUMMY":
      if (/tube/i.test(modelname)) {
        return "D-TUBE";
      } else {
        return "D-LAUNCHER";
      }

    case "CAB_DUMMY":
      return "CAB D-LAUNCHER";
    case "BORDER":
      return "TC1";
    case "B.P":
      return "TC1 ADD";
    case "REMOTE":
      return "RDL";

    default:
      return modelname;
  }
};
