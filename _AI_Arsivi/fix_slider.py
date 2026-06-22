import re

def fix_sliders(filepath):
    with open(filepath, 'rb') as f:
        content = f.read()

    # 1. puanlari_hesapla
    # Replace recCap definition
    content = content.replace(
        b'const recCap = this.config.NORM_GUNCELL_CAP || 80;',
        b'const recCap = this.config.YUZDE_SON_15_DONEM;'
    )

    # Replace 20 with this.config.YUZDE_TUM_GECMIS
    content = content.replace(
        b'gecmis_puani = Math.floor(ratio * 20);',
        b'gecmis_puani = Math.floor(ratio * this.config.YUZDE_TUM_GECMIS);'
    )
    content = content.replace(
        b'gecmis_puani = Math.floor(ratio * -20);',
        b'gecmis_puani = Math.floor(ratio * -this.config.YUZDE_TUM_GECMIS);'
    )

    # 2. getScoreDetails
    # Replace 20 with config.YUZDE_TUM_GECMIS
    content = content.replace(
        b'historical = Math.floor(ratio * 20);',
        b'historical = Math.floor(ratio * config.YUZDE_TUM_GECMIS);'
    )
    content = content.replace(
        b'historical = Math.floor(ratio * -20);',
        b'historical = Math.floor(ratio * -config.YUZDE_TUM_GECMIS);'
    )

    # Replace (config.NORM_GUNCELL_CAP || 80) with config.YUZDE_SON_15_DONEM
    content = content.replace(
        b'(config.NORM_GUNCELL_CAP || 80)',
        b'config.YUZDE_SON_15_DONEM'
    )

    with open(filepath, 'wb') as f:
        f.write(content)
    print("Fixed historical/recent slider bug successfully!")

fix_sliders('PROMPT_BUILDER_v8_0.html')
