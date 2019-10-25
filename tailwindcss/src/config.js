import tailwindcss from 'tailwindcss'
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

  // FIXME find a better way for manipulating webpack config
  // Integrate tailwindcss and purgecss into css pipeline
  const origPluginsFn = m9config.__webpack.module.rules[1].use[2].options.plugins
  m9config.__webpack.module.rules[1].use[2].options.plugins = () => {
    const plugins = origPluginsFn()
    plugins.splice(1, 0, tailwindcss())

    if (m9config.stage !== 'development') {
      plugins.push(
        purgecss({
          content: [
            m9config.paths.srcPages + '/**/*.html.hbs',
            m9config.paths.srcPartials + '/**/*.hbs'
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
