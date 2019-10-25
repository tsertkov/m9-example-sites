import tailwindcss from 'tailwindcss'
import postcssImport from 'postcss-import'
import postcssPresetEnv from 'postcss-preset-env'
import purgecss from '@fullhuman/postcss-purgecss'

module.exports = m9config => {
  const config = {
    default: {
      disallow_robots: true,
      site_url: '/'
    },
    production: {
      disallow_robots: false,
    }
  }

  m9config.__webpack.module.rules[1].use[2].options.plugins = () => {
    const plugins = [
      postcssImport(),
      tailwindcss(),
      postcssPresetEnv({
        stage: 2,
        features: {
          'custom-properties': {
            preserve: false
          },
          'nesting-rules': true,
          'custom-media-queries': true
        }
      })
    ]

    if (m9config.stage !== 'development') {
      plugins.push(
        purgecss({
          content: [
            m9config.paths.srcPages + '/**/*.html.hbs'
          ]
        })
      )
    }

    return plugins
  }

  return {
    ...m9config,
    ...config.default,
    ...config[m9config.stage]
  }
}
